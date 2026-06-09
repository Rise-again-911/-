import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess(data: unknown, message = "ok", status = 200) {
  return NextResponse.json({ data, message }, { status });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function handleZodError(error: ZodError) {
  return apiError(
    "VALIDATION_ERROR",
    error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
    422
  );
}
