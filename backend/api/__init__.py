##########################################
# External Modules
##########################################

from flask import Flask
from flask_cors import CORS
from flask_talisman import Talisman
import logging.config

dict_config = {
    'version': 1,
    'formatters': {
        'default': {
            'format': '[%(asctime)s] {%(pathname)s:%(funcName)s:%(lineno)d} %(levelname)s - %(message)s',
        }
    },
    'handlers': {
        'default': {
        'level': 'DEBUG',
        'formatter': 'default',
        'class': 'logging.handlers.RotatingFileHandler',
        'filename': "test.log",
        'maxBytes': 5000000,
        'backupCount': 10
    },
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'default',
    },
    },
    'loggers': {
        'myapp': {
            'handlers': ["console"],
            'level': 'DEBUG',
        },
    }
}

print(__name__)
logger = logging.getLogger("myapp")
logging.config.dictConfig(dict_config)


from api import exception_views
from api.messages import messages_views
from api.security.auth0_service import auth0_service

from common.utils import safe_get_env_var

def create_app():
    ##########################################
    # Environment Variables
    ##########################################
    client_origin_url = safe_get_env_var("CLIENT_ORIGIN_URL")
    auth0_audience = safe_get_env_var("AUTH0_AUDIENCE")
    auth0_domain = safe_get_env_var("AUTH0_DOMAIN")

    ##########################################
    # Flask App Instance
    ##########################################

    app = Flask(__name__, instance_relative_config=True)
    logger.info("test")
    


    ##########################################
    # HTTP Security Headers
    ##########################################

    csp = {
        'default-src': ['\'self\''],
        'frame-ancestors': ['\'none\'']
    }

    Talisman(
        app,
        force_https=False,
        frame_options='DENY',
        content_security_policy=csp,
        referrer_policy='no-referrer',
        x_xss_protection=False,
        x_content_type_options=True
    )

    auth0_service.initialize(auth0_domain, auth0_audience)

    @app.after_request
    def add_headers(response):
        response.headers['X-XSS-Protection'] = '0'
        response.headers['Cache-Control'] = 'no-store, max-age=0, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response

    ##########################################
    # CORS
    ##########################################

    CORS(
        app,
        resources={r"/api/*": {"origins": client_origin_url}},
        allow_headers=["Authorization", "Content-Type"],
        methods=["GET"],
        max_age=86400
    )

    ##########################################
    # Blueprint Registration
    ##########################################

    app.register_blueprint(messages_views.bp)
    app.register_blueprint(exception_views.bp)

    return app
