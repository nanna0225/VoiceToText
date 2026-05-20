"use client";

import { Patient } from "@/lib/types";
import { Activity, Calendar, Hash, User, Tag } from "lucide-react";

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        <span className="font-bold text-blue-700 text-base tracking-tight">
          MedAI Scribe
        </span>
        <span className="text-slate-300 mx-1">|</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Clinical Decision Support
        </span>
      </div>

      <div className="flex items-center gap-5 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono font-semibold text-slate-800">
            {patient.id}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {patient.gender === "M" ? "남성" : "여성"},{" "}
            <span className="font-semibold">{patient.age}세</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{patient.visitDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            v{patient.version}
          </span>
        </div>
      </div>
    </div>
  );
}
