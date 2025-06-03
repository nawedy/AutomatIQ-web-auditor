import { NextRequest, NextResponse } from 'next/server';
import { webhookService } from '@/lib/strapi-services';
import type { StrapiWebhookPayload } from '@/types/strapi';

/**
 * Handle incoming webhooks from Strapi CMS
 * This endpoint receives notifications when content is created, updated, or deleted
 * and handles cache invalidation accordingly
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-strapi-signature');
      
      if (!signature || signature !== webhookSecret) {
        console.warn('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const payload: StrapiWebhookPayload = await request.json();
    
    console.log('Received Strapi webhook:', {
      event: payload.event,
      model: payload.model,
      entryId: payload.entry?.id,
      timestamp: payload.createdAt,
    });

    // Handle the webhook
    webhookService.handleWebhook(payload);

    // Log the event for debugging
    console.log(`Processed ${payload.event} event for ${payload.model}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook processed successfully',
        event: payload.event,
        model: payload.model 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing Strapi webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for webhook verification (if needed)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // Return the challenge for webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json(
    { 
      message: 'Strapi webhook endpoint is active',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
} 