import { z } from 'zod'
import {
  meetingInsertSchema,
  meetingUpdateSchema,
  agentsInsertSchema,
  agentUpdateSchema,
  subscriptionSchema,
} from '../schemas'

describe('Schemas Validation', () => {
  describe('meetingInsertSchema', () => {
    it('should validate valid meeting data', () => {
      const validData = {
        title: 'Team Meeting',
        description: 'Weekly team sync',
        agentId: 'agent-123',
        scheduledAt: new Date('2024-12-01T10:00:00Z'),
      }

      expect(() => meetingInsertSchema.parse(validData)).not.toThrow()
    })

    it('should require title', () => {
      const invalidData = {
        description: 'Weekly team sync',
      }

      expect(() => meetingInsertSchema.parse(invalidData)).toThrow()
    })

    it('should validate title length', () => {
      const invalidData = {
        title: '', // Empty title
      }

      expect(() => meetingInsertSchema.parse(invalidData)).toThrow()
    })

    it('should accept optional fields', () => {
      const validData = {
        title: 'Team Meeting',
        // description and agentId are optional
        // scheduledAt is optional
      }

      expect(() => meetingInsertSchema.parse(validData)).not.toThrow()
    })

    it('should validate scheduledAt as Date', () => {
      const validData = {
        title: 'Team Meeting',
        scheduledAt: new Date(),
      }

      expect(() => meetingInsertSchema.parse(validData)).not.toThrow()

      const invalidData = {
        title: 'Team Meeting',
        scheduledAt: 'invalid-date',
      }

      expect(() => meetingInsertSchema.parse(invalidData)).toThrow()
    })
  })

  describe('meetingUpdateSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        id: 'meeting-123',
        title: 'Updated Meeting Title',
        description: 'Updated description',
        agentId: 'agent-456',
        scheduledAt: new Date(),
      }

      expect(() => meetingUpdateSchema.parse(validData)).not.toThrow()
    })

    it('should require id', () => {
      const invalidData = {
        title: 'Updated Title',
      }

      expect(() => meetingUpdateSchema.parse(invalidData)).toThrow()
    })

    it('should make all other fields optional', () => {
      const validData = {
        id: 'meeting-123',
        // All other fields are optional for updates
      }

      expect(() => meetingUpdateSchema.parse(validData)).not.toThrow()
    })
  })

  describe('agentsInsertSchema', () => {
    it('should validate valid agent data', () => {
      const validData = {
        name: 'Sales Assistant',
        instructions: 'Help with sales inquiries and provide product information.',
      }

      expect(() => agentsInsertSchema.parse(validData)).not.toThrow()
    })

    it('should require name and instructions', () => {
      const invalidData1 = {
        instructions: 'Some instructions',
      }

      const invalidData2 = {
        name: 'Agent Name',
      }

      expect(() => agentsInsertSchema.parse(invalidData1)).toThrow()
      expect(() => agentsInsertSchema.parse(invalidData2)).toThrow()
    })

    it('should validate name and instructions are not empty', () => {
      const invalidData = {
        name: '',
        instructions: '',
      }

      expect(() => agentsInsertSchema.parse(invalidData)).toThrow()
    })
  })

  describe('agentUpdateSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        id: 'agent-123',
        name: 'Updated Agent Name',
        instructions: 'Updated instructions',
      }

      expect(() => agentUpdateSchema.parse(validData)).not.toThrow()
    })

    it('should require id', () => {
      const invalidData = {
        name: 'Updated Name',
      }

      expect(() => agentUpdateSchema.parse(invalidData)).toThrow()
    })

    it('should make name and instructions optional for updates', () => {
      const validData = {
        id: 'agent-123',
        // name and instructions are optional
      }

      expect(() => agentUpdateSchema.parse(validData)).not.toThrow()
    })
  })

  describe('subscriptionSchema', () => {
    it('should validate valid subscription plan', () => {
      const validData = {
        plan: 'pro' as const,
      }

      expect(() => subscriptionSchema.parse(validData)).not.toThrow()
    })

    it('should accept all valid plan types', () => {
      const plans = ['free', 'pro', 'enterprise'] as const

      plans.forEach(plan => {
        const validData = { plan }
        expect(() => subscriptionSchema.parse(validData)).not.toThrow()
      })
    })

    it('should reject invalid plan types', () => {
      const invalidData = {
        plan: 'invalid-plan',
      }

      expect(() => subscriptionSchema.parse(invalidData)).toThrow()
    })
  })

  describe('Schema Integration', () => {
    it('should work with TypeScript inference', () => {
      type MeetingInsert = z.infer<typeof meetingInsertSchema>
      type MeetingUpdate = z.infer<typeof meetingUpdateSchema>
      type AgentInsert = z.infer<typeof agentsInsertSchema>
      type AgentUpdate = z.infer<typeof agentUpdateSchema>
      type SubscriptionCreate = z.infer<typeof subscriptionSchema>

      // Type checks - if these compile, types are correct
      const meetingInsert: MeetingInsert = {
        title: 'Test',
        description: 'Test desc',
        agentId: 'agent-123',
        scheduledAt: new Date(),
      }

      const meetingUpdate: MeetingUpdate = {
        id: 'meeting-123',
        title: 'Updated',
      }

      const agentInsert: AgentInsert = {
        name: 'Test Agent',
        instructions: 'Test instructions',
      }

      const agentUpdate: AgentUpdate = {
        id: 'agent-123',
        name: 'Updated Agent',
      }

      const subscription: SubscriptionCreate = {
        plan: 'pro',
      }

      expect(meetingInsert).toBeDefined()
      expect(meetingUpdate).toBeDefined()
      expect(agentInsert).toBeDefined()
      expect(agentUpdate).toBeDefined()
      expect(subscription).toBeDefined()
    })
  })
})
