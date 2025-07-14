"""[summary]
"""

import os
from dotenv import load_dotenv

class Config:
    PERMANENT = True
    SECRET_KEY = os.getenv("SECRET_KEY")        

class ProductionConfig(Config):
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    load_dotenv(os.path.join(BASEDIR, ".env"))
    SECRET_KEY = os.getenv("SECRET_KEY")

    DEBUG = False
    FLASK_DEBUG=False
    
    SQLALCHEMY_DATABASE_URI = 'sqlite:///prod.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    POOL_RECYCLE = 60
    PRESERVE_CONTEXT_ON_EXCEPTION = True


class DevelopmentConfig(Config):
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    load_dotenv(os.path.join(BASEDIR, ".env"))
    
    SECRET_KEY = os.getenv("SECRET_KEY")
    DEBUG = True
    FLASK_DEBUG=True

    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASEDIR, "dev_database.db")}'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    POOL_RECYCLE = 60
    DEBUG_TB_INTERCEPT_REDIRECTS =False
    SQLALCHEMY_RECORD_QUERIES = True

class TestingConfig(Config):
    
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    load_dotenv(os.path.join(BASEDIR, ".env"))
    SECRET_KEY = os.getenv("SECRET_KEY")

    TESTING = True
    DEBUG = False
    FLASK_DEBUG=False

    SQLALCHEMY_DATABASE_URI = 'sqlite:///test_database.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    POOL_RECYCLE = 60


config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
