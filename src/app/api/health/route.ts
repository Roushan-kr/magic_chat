import dbConnect from '@/lib/dbconnect'
import { NextRequest, NextResponse } from 'next/server'
import os from 'os'
import process from 'process'

export async function GET(request: NextRequest) {
  try {
    // Collect system and application health metrics
    const healthCheck = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      status: 'healthy',
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      process: {
        pid: process.pid,
        memoryUsage: process.memoryUsage(),
        version: process.version,
      },
      checks: {
        database: await checkDatabaseConnection(),
      }
    }

    return NextResponse.json(healthCheck, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    })
  }
}

// Mock database connection check
async function checkDatabaseConnection() {
  try {
    await dbConnect()
    return { 
      status: 'connected', 
      timestamp: Date.now() 
    }
  } catch (error) {
    return { 
      status: 'disconnected', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Ensure this route cannot be cached
export const dynamic = 'force-dynamic'