import { agentsRouter } from '../procedures'

// Mock database and auth
jest.mock('../../../../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    eq: jest.fn(),
    and: jest.fn(),
    limit: jest.fn(),
    orderBy: jest.fn(),
    desc: jest.fn(),
    returning: jest.fn(),
  },
}))

jest.mock('../../../../lib/subscription-limits', () => ({
  checkAgentLimit: jest.fn(),
}))

describe('Agents Router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMany', () => {
    it('should return agents for authenticated user', async () => {
      const mockDb = require('../../../../db').db

      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Sales Agent',
          instructions: 'Help with sales',
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockAgents)
          })
        })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)
      const result = await caller.getMany()

      expect(result).toEqual(mockAgents)
      expect(mockDb.select).toHaveBeenCalled()
    })
  })

  describe('getOne', () => {
    it('should return single agent', async () => {
      const mockDb = require('../../../../db').db

      const mockAgent = {
        id: 'agent-1',
        name: 'Sales Agent',
        instructions: 'Help with sales',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockAgent])
          })
        })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)
      const result = await caller.getOne({ id: 'agent-1' })

      expect(result).toEqual(mockAgent)
    })

    it('should throw error for non-existent agent', async () => {
      const mockDb = require('../../../../db').db

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)

      await expect(caller.getOne({ id: 'non-existent' })).rejects.toThrow('Agent not found')
    })
  })

  describe('create', () => {
    it('should create agent when within limits', async () => {
      const mockDb = require('../../../../db').db
      const mockCheckLimit = require('../../../../lib/subscription-limits').checkAgentLimit

      mockCheckLimit.mockResolvedValue({
        canCreate: true,
        current: 1,
        limit: 5,
      })

      const mockCreatedAgent = {
        id: 'agent-new',
        name: 'New Agent',
        instructions: 'New instructions',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedAgent])
        })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)
      const result = await caller.create({
        name: 'New Agent',
        instructions: 'New instructions',
      })

      expect(result).toEqual(mockCreatedAgent)
      expect(mockCheckLimit).toHaveBeenCalledWith('user-123')
    })

    it('should throw error when limit exceeded', async () => {
      const mockCheckLimit = require('../../../../lib/subscription-limits').checkAgentLimit

      mockCheckLimit.mockResolvedValue({
        canCreate: false,
        current: 5,
        limit: 5,
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)

      await expect(caller.create({
        name: 'New Agent',
        instructions: 'New instructions',
      })).rejects.toThrow('Agent limit reached. You can create 5 agents. Current: 5')
    })
  })

  describe('update', () => {
    it('should update agent successfully', async () => {
      const mockDb = require('../../../../db').db

      const mockUpdatedAgent = {
        id: 'agent-1',
        name: 'Updated Agent',
        instructions: 'Updated instructions',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedAgent])
          })
        })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)
      const result = await caller.update({
        id: 'agent-1',
        name: 'Updated Agent',
        instructions: 'Updated instructions',
      })

      expect(result).toEqual(mockUpdatedAgent)
    })
  })

  describe('delete', () => {
    it('should delete agent successfully', async () => {
      const mockDb = require('../../../../db').db

      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({ success: true })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)
      const result = await caller.delete({ id: 'agent-1' })

      expect(result).toEqual({ success: true })
    })
  })

  describe('duplicate', () => {
    it('should duplicate agent successfully', async () => {
      const mockDb = require('../../../../db').db

      const mockOriginalAgent = {
        id: 'agent-1',
        name: 'Original Agent',
        instructions: 'Original instructions',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockDuplicatedAgent = {
        id: 'agent-2',
        name: 'Original Agent (Copy)',
        instructions: 'Original instructions',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOriginalAgent])
          })
        })
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockDuplicatedAgent])
        })
      })

      const ctx = {
        auth: {
          user: { id: 'user-123' }
        }
      }

      const caller = agentsRouter.createCaller(ctx)
      const result = await caller.duplicate({ id: 'agent-1' })

      expect(result).toEqual(mockDuplicatedAgent)
      expect(result.name).toBe('Original Agent (Copy)')
    })
  })
})
