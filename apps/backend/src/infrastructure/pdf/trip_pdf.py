from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


def generate_trip_pdf(output_path: Path, trip: dict, activities: list[dict], expenses: list[dict]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    y = height - 2 * cm

    def draw_line(text: str, step: float = 0.7 * cm) -> None:
        nonlocal y
        c.drawString(2 * cm, y, text)
        y -= step
        if y < 2 * cm:
            c.showPage()
            y = height - 2 * cm

    c.setFont("Helvetica-Bold", 16)
    draw_line(f"Viaggio: {trip.get('title', '-')}", step=1 * cm)
    c.setFont("Helvetica", 11)

    destination = trip.get("destination") or {}
    city = destination.get("city") or "-"
    country = destination.get("country") or "-"

    draw_line(f"Destinazione: {city}, {country}")
    draw_line(f"Stato: {trip.get('status', '-')}")
    draw_line(f"Periodo: {trip.get('start_date')} -> {trip.get('end_date')}")
    draw_line(f"Descrizione: {trip.get('description') or '-'}")
    draw_line("")

    participants = trip.get("participants") or []
    draw_line("Partecipanti:")
    if not participants:
        draw_line("- Nessuno")
    else:
        for p in participants:
            draw_line(f"- {p}")

    draw_line("")
    draw_line("Attivita / Tappe:")
    if not activities:
        draw_line("- Nessuna")
    else:
        for item in activities:
            draw_line(
                f"- {item.get('title', '-')}: {item.get('start_at') or '-'} -> {item.get('end_at') or '-'}"
            )

    draw_line("")
    draw_line("Spese:")
    total = 0.0
    if not expenses:
        draw_line("- Nessuna")
    else:
        for e in expenses:
            amount = float(e.get("amount", 0))
            total += amount
            draw_line(f"- {e.get('category', '-')}: {amount:.2f} {e.get('currency', 'EUR')}")

    draw_line("")
    draw_line(f"Totale spese: {total:.2f} EUR")

    c.showPage()
    c.save()
