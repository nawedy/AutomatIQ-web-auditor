// src/app/api/admin/clients/route.ts
// Admin API route for fetching client data

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

// GET handler for fetching all clients (admin only)
export const GET = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string; role?: string }
) => {
  // Check if user has admin role
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    )
  }

  try {
    // Get query parameters for filtering
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const plan = url.searchParams.get("plan")
    const search = url.searchParams.get("search")
    
    // Build filter object
    const filter: any = {}
    
    if (status) {
      filter.status = status
    }
    
    if (plan) {
      filter.plan = plan
    }
    
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }
    
    // Fetch clients with their websites count and latest audit
    const clients = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
        _count: {
          select: {
            websites: true
          }
        },
        websites: {
          select: {
            id: true,
            audits: {
              orderBy: {
                createdAt: "desc"
              },
              take: 1,
              select: {
                id: true,
                createdAt: true,
                status: true,
                auditResults: {
                  where: {
                    severity: "error"
                  },
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastActive: "desc"
      }
    })
    
    // Transform data for client-side consumption
    const formattedClients = clients.map(client => {
      // Count total issues across all websites
      let issueCount = 0
      client.websites.forEach(website => {
        website.audits.forEach(audit => {
          issueCount += audit.auditResults.length
        })
      })
      
      return {
        id: client.id,
        name: client.name || "Unnamed Client",
        email: client.email,
        plan: client.plan || "Free Trial",
        status: client.status || "active",
        lastActive: client.lastActive || client.updatedAt || client.createdAt,
        websites: client._count.websites,
        issueCount,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }
    })
    
    return NextResponse.json(formattedClients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
})

// POST handler for creating a new client (admin only)
export const POST = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string; role?: string }
) => {
  // Check if user has admin role
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      )
    }
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        plan: body.plan || "Free Trial",
        status: body.status || "active",
        role: "user", // Ensure new clients are created with user role
      }
    })
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
})
