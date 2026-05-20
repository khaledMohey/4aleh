from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.core.services.dashboard_service import DashboardService
from apps.core.services.search_service import SearchService
from apps.core.services.report_service import ReportService
from apps.core.services.profit_service import ProfitService
from apps.bookings.serializers import BookingSerializer


class DashboardView(APIView):
    def get(self, request):
        stats = DashboardService.get_stats()
        latest = stats.pop('latest_bookings')
        stats['latest_bookings'] = BookingSerializer(latest, many=True).data
        stats['profit_summary'] = ProfitService.calculate_system_profit()
        return Response({'success': True, 'data': stats})


class GlobalSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        results = SearchService.global_search(query)
        return Response({'success': True, 'data': results})


class ReportsView(APIView):
    def get(self, request):
        report_type = request.query_params.get('type', 'profit')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        chalet_id = request.query_params.get('chalet_id')
        export_format = request.query_params.get('export')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        if chalet_id:
            chalet_id = int(chalet_id)

        data = {}

        if report_type == 'profit':
            data = ReportService.get_profit_report(start_date, end_date)
        elif report_type == 'bookings':
            report = ReportService.get_bookings_report(start_date, end_date, chalet_id)
            data = {
                'count': report['count'],
                'total_revenue': report['total_revenue'],
                'bookings': BookingSerializer(report['bookings'][:100], many=True).data,
            }
        elif report_type == 'expenses':
            report = ReportService.get_expenses_report(start_date, end_date, chalet_id)
            from apps.expenses.serializers import ExpenseSerializer
            data = {
                'count': report['count'],
                'total': report['total'],
                'by_type': report['by_type'],
                'expenses': ExpenseSerializer(report['expenses'][:100], many=True).data,
            }
        elif report_type == 'occupancy':
            data = ReportService.get_occupancy_report()
        elif report_type == 'chalet' and chalet_id:
            data = ProfitService.calculate_chalet_profit(chalet_id)
        else:
            data = ProfitService.calculate_system_profit()

        if export_format == 'excel' and report_type == 'bookings':
            report = ReportService.get_bookings_report(start_date, end_date, chalet_id)
            rows = [
                [b.customer.name, b.chalet.name, str(b.check_in), str(b.check_out),
                 float(b.final_amount), b.payment_status]
                for b in report['bookings']
            ]
            return ReportService.export_excel(
                'bookings', rows,
                ['العميل', 'الشاليه', 'الدخول', 'الخروج', 'المبلغ', 'الدفع'],
                'bookings_report',
            )
        elif export_format == 'pdf' and report_type == 'bookings':
            report = ReportService.get_bookings_report(start_date, end_date, chalet_id)
            rows = [
                [b.customer.name, b.chalet.name, str(b.check_in), str(b.check_out),
                 str(b.final_amount)]
                for b in report['bookings'][:50]
            ]
            return ReportService.export_pdf(
                'تقرير الحجوزات',
                ['العميل', 'الشاليه', 'الدخول', 'الخروج', 'المبلغ'],
                rows,
                'bookings_report',
            )

        return Response({'success': True, 'data': data})
