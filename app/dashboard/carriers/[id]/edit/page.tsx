import { CarrierForm } from "@/components/carriers/carrier-form"

export default function EditCarrierPage({ params }: { params: { id: string } }) {
  const carrierId = Number.parseInt(params.id, 10)

  return (
    <div className="container mx-auto p-6">
      <CarrierForm carrierId={carrierId} isEditMode={true} />
    </div>
  )
}
