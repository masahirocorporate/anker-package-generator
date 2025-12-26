import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({ history: data });
  } catch (error) {
    console.error("履歴取得エラー:", error);
    return NextResponse.json(
      { error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "IDが必要です" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("削除エラー:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}



