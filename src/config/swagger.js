import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Contacts API",
    version: "1.0.0",
    description:
      "A simple Contacts REST API with user authentication (JWT), pagination and filtering.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      UserRegister: {
        type: "object",
        required: ["name", "password"],
        properties: {
          name: { type: "string", example: "amir" },
          password: { type: "string", example: "123456" },
        },
      },
      UserLogin: {
        type: "object",
        required: ["name", "password"],
        properties: {
          name: { type: "string", example: "amir" },
          password: { type: "string", example: "123456" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          public_id: {
            type: "string",
            format: "uuid",
            example: "4e188d04-13eb-45b6-b425-70cfec4e0477",
          },
          name: { type: "string", example: "amir" },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2025-11-16T12:34:56.000Z",
          },
        },
      },
      ContactCreate: {
        type: "object",
        required: ["name", "phone"],
        properties: {
          name: { type: "string", example: "Ali Reza" },
          phone: { type: "string", example: "09123456789" },
        },
      },
      Contact: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          public_id: {
            type: "string",
            format: "uuid",
            example: "c880a9bb-6528-4a5c-8a0a-f1b709c51e3e",
          },
          name: { type: "string", example: "Ali Reza" },
          phone: { type: "string", example: "09123456789" },
          user_id: { type: "integer", example: 1 },
          created_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 42 },
          totalPages: { type: "integer", example: 5 },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Server error" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "name" },
                message: { type: "string", example: "نام الزامی است" },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/modules/**/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
