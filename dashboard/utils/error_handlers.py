import logging
from flask import render_template, request, jsonify

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    """Register error handlers for the application"""
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Not found'}), 404
        
        return render_template('error.html', 
                             error_code=404,
                             error_message="Page not found",
                             username=request.cookies.get('username')), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        logger.error(f"Internal server error: {error}")
        
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Internal server error'}), 500
        
        return render_template('error.html',
                             error_code=500,
                             error_message="Internal server error",
                             username=request.cookies.get('username')), 500
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 errors"""
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Forbidden'}), 403
        
        return render_template('error.html',
                             error_code=403,
                             error_message="Access forbidden",
                             username=request.cookies.get('username')), 403
    
    @app.errorhandler(429)
    def ratelimit_handler(error):
        """Handle rate limit errors"""
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        return render_template('error.html',
                             error_code=429,
                             error_message="Rate limit exceeded",
                             username=request.cookies.get('username')), 429