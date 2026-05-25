import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ProgressDonutProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ProgressDonut: React.FC<ProgressDonutProps> = ({ 
  progress, 
  size = 80, 
  strokeWidth = 8,
  color = "#ea580c"
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  const data = [
    { name: "Completed", value: normalizedProgress },
    { name: "Remaining", value: 100 - normalizedProgress },
  ];

  const progressColor = color === "white" ? "#FFFFFF" : color; 

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={progressColor} />
            <Cell fill={color === "white" ? "rgba(255,255,255,0.1)" : "#f1f5f9"} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <span className={`text-sm font-semibold leading-none ${color === "white" ? 'text-white' : 'text-slate-950'}`}>
          {Math.round(normalizedProgress)}%
        </span>
      </div>
    </div>
  );
};
