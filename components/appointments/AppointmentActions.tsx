"use client";

type Props = {
  id: number;
};

export default function AppointmentActions({ id }: Props) {

  async function confirmAppointment() {
    await fetch("/api/appointments/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    window.location.reload();
  }

  async function cancelAppointment() {
    await fetch("/api/appointments/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    window.location.reload();
  }

  return (
    <>
      <button
        onClick={confirmAppointment}
        className="bg-green-600 text-white px-3 py-1 rounded mr-2"
      >
        Confirm
      </button>

      <button
        onClick={cancelAppointment}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Cancel
      </button>
    </>
  );
}