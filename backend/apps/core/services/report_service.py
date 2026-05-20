from datetime import date
from decimal import Decimal
from io import BytesIO

from django.db.models import Sum, Count
from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from apps.bookings.models import Booking
from apps.expenses.models import Expense
from apps.chalets.models import Chalet
from apps.core.services.profit_service import ProfitService


class ReportService:
    @staticmethod
    def filter_bookings(start_date=None, end_date=None, chalet_id=None):
        qs = Booking.objects.select_related('chalet', 'customer').exclude(
            status=Booking.Status.CANCELLED
        )
        if start_date:
            qs = qs.filter(check_in__gte=start_date)
        if end_date:
            qs = qs.filter(check_out__lte=end_date)
        if chalet_id:
            qs = qs.filter(chalet_id=chalet_id)
        return qs

    @staticmethod
    def filter_expenses(start_date=None, end_date=None, chalet_id=None):
        qs = Expense.objects.select_related('chalet')
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if chalet_id:
            qs = qs.filter(chalet_id=chalet_id)
        return qs

    @staticmethod
    def get_profit_report(start_date=None, end_date=None):
        return ProfitService.calculate_system_profit()

    @staticmethod
    def get_bookings_report(start_date=None, end_date=None, chalet_id=None):
        qs = ReportService.filter_bookings(start_date, end_date, chalet_id)
        return {
            'count': qs.count(),
            'total_revenue': float(qs.aggregate(t=Sum('final_amount'))['t'] or 0),
            'bookings': qs,
        }

    @staticmethod
    def get_expenses_report(start_date=None, end_date=None, chalet_id=None):
        qs = ReportService.filter_expenses(start_date, end_date, chalet_id)
        by_type = qs.values('expense_type').annotate(
            total=Sum('amount'), count=Count('id')
        )
        return {
            'count': qs.count(),
            'total': float(qs.aggregate(t=Sum('amount'))['t'] or 0),
            'by_type': list(by_type),
            'expenses': qs,
        }

    @staticmethod
    def get_occupancy_report():
        chalets = Chalet.objects.filter(is_active=True)
        data = []
        for chalet in chalets:
            bookings = Booking.objects.filter(
                chalet=chalet
            ).exclude(status=Booking.Status.CANCELLED)
            total_days = sum(b.days_count for b in bookings)
            data.append({
                'chalet_id': chalet.id,
                'chalet_name': chalet.name,
                'status': chalet.status,
                'total_booking_days': total_days,
                'booking_count': bookings.count(),
            })
        return data

    @staticmethod
    def export_excel(report_type, data_rows, headers, filename='report'):
        wb = Workbook()
        ws = wb.active
        ws.title = report_type
        ws.append(headers)
        for row in data_rows:
            ws.append(row)
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
        return response

    @staticmethod
    def export_pdf(title, headers, data_rows, filename='report'):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = [
            Paragraph(title, styles['Title']),
            Spacer(1, 12),
        ]
        table_data = [headers] + data_rows
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        return response
