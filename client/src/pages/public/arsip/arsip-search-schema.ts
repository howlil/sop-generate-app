import { z } from 'zod'

export const arsipBrowseSearchSchema = z.object({
  opdId: z.string().optional(),
  q: z.string().max(200).optional(),
  detailSopId: z.string().optional(),
  opdPage: z.coerce.number().int().min(1).optional(),
  sopPage: z.coerce.number().int().min(1).optional(),
})

export type ArsipBrowseSearch = z.infer<typeof arsipBrowseSearchSchema>
