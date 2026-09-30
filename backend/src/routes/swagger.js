export const openapi = {
  openapi: '3.0.3',

  info: {
    title: 'ClinicFlow API',
    version: '1.0.0',
    description: 'Patient and appointment management API'
  },

  servers: [
    {
      url: '/api'
    }
  ],

  paths: {
    '/auth/login': {
      post: {
        summary: 'Login',

        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],

                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },

        responses: {
          200: {
            description: 'Authenticated'
          },
          401: {
            description: 'Invalid credentials'
          }
        }
      }
    },

    '/auth/me': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Current user'
          }
        }
      }
    },

    '/patients': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],

        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer'
            }
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              maximum: 100
            }
          }
        ],

        responses: {
          200: {
            description: 'Paginated patients'
          }
        }
      },

      post: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          201: {
            description: 'Created'
          }
        }
      }
    },

    '/patients/{id}': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Patient'
          }
        }
      },

      put: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Updated'
          }
        }
      },

      delete: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          204: {
            description: 'Deleted'
          },
          403: {
            description: 'Admin only'
          }
        }
      }
    },

    '/patients/{id}/appointments': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Patient appointments'
          }
        }
      }
    },

    '/appointments': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Appointments'
          }
        }
      },

      post: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          201: {
            description: 'Created'
          },
          409: {
            description: '30-minute conflict'
          }
        }
      }
    },

    '/appointments/{id}/status': {
      patch: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Updated'
          },
          409: {
            description: '30-minute conflict'
          }
        }
      }
    },

    '/dashboard/stats': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],

        responses: {
          200: {
            description: 'Dashboard counts'
          }
        }
      }
    }
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};