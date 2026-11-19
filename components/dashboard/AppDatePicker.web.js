function toInputDate(value) {
  const date = value instanceof Date ? value : new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

export default function AppDatePicker({ value, maximumDate, onChange }) {
  return (
    <input
      aria-label="Select date"
      type="date"
      value={toInputDate(value)}
      max={maximumDate ? toInputDate(maximumDate) : undefined}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (nextValue) onChange?.(event, new Date(`${nextValue}T00:00:00`));
      }}
      style={{
        position: "absolute",
        right: 20,
        bottom: 24,
        zIndex: 20,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
      }}
    />
  );
}
