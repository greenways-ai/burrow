import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Address } from 'viem';

const ADMIN_WALLET = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();

interface AdminRequest {
  walletAddress: Address;
  signature: string;
  content: string;
}

function verifyAdminWallet(address: Address): boolean {
  return address.toLowerCase() === ADMIN_WALLET;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return Response.json(
        { error: 'Failed to fetch system prompt' },
        { status: 500 }
      );
    }

    return Response.json({ prompt: data });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AdminRequest = await request.json();
    const { walletAddress, content } = body;

    // Verify admin wallet
    if (!verifyAdminWallet(walletAddress)) {
      return Response.json(
        { error: 'Unauthorized: Not an admin wallet' },
        { status: 403 }
      );
    }

    if (!content || content.trim().length === 0) {
      return Response.json(
        { error: 'Prompt content is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Deactivate current prompt
    await supabase
      .from('system_prompts')
      .update({ is_active: false })
      .eq('is_active', true);

    // Get next version number
    const { data: versionData } = await supabase
      .from('system_prompts')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (versionData?.version || 0) + 1;

    // Insert new prompt
    const { data, error } = await supabase
      .from('system_prompts')
      .insert({
        content: content.trim(),
        version: nextVersion,
        is_active: true,
        updated_by: walletAddress.toLowerCase(),
      })
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: 'Failed to update system prompt' },
        { status: 500 }
      );
    }

    return Response.json({ prompt: data });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}

// Get prompt history
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    // Verify admin wallet
    if (!verifyAdminWallet(walletAddress)) {
      return Response.json(
        { error: 'Unauthorized: Not an admin wallet' },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .order('version', { ascending: false })
      .limit(20);

    if (error) {
      return Response.json(
        { error: 'Failed to fetch prompt history' },
        { status: 500 }
      );
    }

    return Response.json({ prompts: data });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
