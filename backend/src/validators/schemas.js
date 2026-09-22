const { z } = require('zod');

const languageQuery = z.object({
  lang: z.enum(['en', 'hi']).optional(),
});

const idParam = z.object({
  id: z.string().min(1, 'Competition identifier is required'),
});

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  referredByCode: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const languageSchema = z.object({
  language: z.enum(['en', 'hi']),
});

const registerSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(100).optional(),
  payment: z
    .object({
      orderId: z.string().trim().optional(),
      referenceId: z.string().trim().optional(),
      signature: z.string().trim().optional(),
    })
    .optional(),
});

const submissionSchema = z.object({
  fileUrl: z.string().trim().url('A valid submission URL is required'),
  fileName: z.string().trim().max(200).optional(),
  mimeType: z.string().trim().max(100).optional(),
  sizeBytes: z.number().int().positive().max(512 * 1024 * 1024).optional(),
  caption: z.string().trim().max(300).optional(),
});

const listQuery = languageQuery.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().trim().optional(),
});

module.exports = {
  languageQuery,
  idParam,
  signupSchema,
  loginSchema,
  languageSchema,
  registerSchema,
  submissionSchema,
  listQuery,
};
