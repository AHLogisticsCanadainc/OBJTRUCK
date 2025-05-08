import { CarrierDetails } from "@/components/carriers/carrier-details"

export default function CarrierDetailsPage({ params }: { params: { id: string } }) {
  const carrierId = Number.parseInt(params.id, 10)

  return (
    <div className="container mx-auto p-6">
      <CarrierDetails carrierId={carrierId} />
    </div>
  )
}
