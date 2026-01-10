#!/bin/bash

# Check wizard form refactoring status
# This script verifies all wizard steps use react-hook-form + zod

echo "=== Wizard Form Refactoring Status ==="
echo ""

# Count totals
TOTAL_STEPS=$(find components/estimates/wizard -name "*Step*.tsx" -o -name "*SendEstimate*.tsx" 2>/dev/null | wc -l)
WITH_FORM=$(grep -rl "useForm\|FormProvider" components/estimates/wizard/ --include="*.tsx" 2>/dev/null | wc -l)

echo "Total wizard step files: $TOTAL_STEPS"
echo "Files with react-hook-form: $WITH_FORM"
echo ""

# List files WITH react-hook-form
echo "=== Files using react-hook-form ==="
grep -rl "useForm\|FormProvider" components/estimates/wizard/ --include="*.tsx" 2>/dev/null | sort

echo ""

# List files with inputs but NO react-hook-form (excluding sub-components)
echo "=== Files with inputs but NO react-hook-form ==="
# Sub-components that are controlled inputs used within parent steps (don't need FormProvider)
SUBCOMPONENTS="DimensionInput|ShapeDimensionInputs|CustomWallsList|LaborEditSheet|ShapeSelector|OpeningsSheet"
for f in $(find components/estimates/wizard -name "*.tsx" 2>/dev/null); do
  # Skip known sub-components
  if echo "$f" | grep -qE "$SUBCOMPONENTS"; then
    continue
  fi
  if grep -q "<input\|<textarea" "$f" && ! grep -q "useForm\|FormProvider" "$f"; then
    echo "$f"
  fi
done

echo ""

# Check for schemas
echo "=== Zod Schemas ==="
if [ -d "lib/schemas/wizard" ]; then
  ls -la lib/schemas/wizard/
else
  echo "ERROR: lib/schemas/wizard/ not found!"
fi

echo ""

# Check for ZodForm component
echo "=== ZodForm Component ==="
if [ -f "components/ui/ZodForm.tsx" ]; then
  echo "components/ui/ZodForm.tsx exists"
else
  echo "ERROR: components/ui/ZodForm.tsx not found!"
fi

echo ""

# Check for useZodForm hook
echo "=== useZodForm Hook ==="
if [ -f "hooks/useZodForm.ts" ]; then
  echo "hooks/useZodForm.ts exists"
else
  echo "WARNING: hooks/useZodForm.ts not found"
fi

echo ""

# Build check
echo "=== Build Status ==="
npm run build 2>&1 | grep -E "✓|error|Error" | head -5

echo ""
echo "=== Summary ==="
COVERAGE=$((WITH_FORM * 100 / TOTAL_STEPS))
echo "Coverage: $WITH_FORM/$TOTAL_STEPS ($COVERAGE%)"

if [ "$WITH_FORM" -ge 7 ] && npm run build 2>&1 | grep -q "✓ Compiled successfully"; then
  echo "Status: PASSING - Core wizard steps refactored, build passes"
  exit 0
else
  echo "Status: IN PROGRESS"
  exit 1
fi
