import logging

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        logger.error('API Error: %s - %s', exc, context.get('view'))
        custom_data = {
            'success': False,
            'error': response.data,
            'status_code': response.status_code,
        }
        response.data = custom_data
    else:
        logger.exception('Unhandled exception: %s', exc)
        return Response(
            {'success': False, 'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    return response
