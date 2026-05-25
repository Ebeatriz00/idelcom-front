import React from "react";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold mb-4">{title}</h2>
            {children}
        </div>
    );
}