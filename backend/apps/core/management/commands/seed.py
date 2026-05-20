from django.core.management.base import BaseCommand
import subprocess
import sys
from pathlib import Path


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        script = Path(__file__).resolve().parents[4] / 'scripts' / 'seed_data.py'
        subprocess.run([sys.executable, str(script)], check=True)
        self.stdout.write(self.style.SUCCESS('Database seeded successfully'))
