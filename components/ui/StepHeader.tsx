"use client";

interface StepHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function StepHeader({
  title,
  description,
  className = "",
}: StepHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-gray-500 text-center mb-6">{description}</p>
      )}
    </div>
  );
}
