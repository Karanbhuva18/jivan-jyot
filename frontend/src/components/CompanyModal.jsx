import { useState } from "react";
import { useCreateCompany, useUpdateCompany } from "../hooks/useAddPatient.js";
import "./CompanyModal.css";
import toast from "react-hot-toast";

const CompanyModal = ({ close, editData }) => {
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

  const isPending = isCreating || isUpdating;

  const [form, setForm] = useState({
    name: editData?.name || "",
    authorizedPersonName: editData?.authorizedPersonName || "",
    address: editData?.address || "",
    contact: editData?.contact || "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (editData) {
      updateCompany(
        { id: editData.id, payload: form },
        {
          onSuccess: () => {
            toast.success("✅ Company updated successfully");
            if (document.activeElement) document.activeElement.blur();
            close();
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "❌ Error updating company");
          },
        }
      );
    } else {
      createCompany(form, {
        onSuccess: () => {
          toast.success("✅ Company created successfully");
          if (document.activeElement) document.activeElement.blur();
          close();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "❌ Error creating company");
        },
      });
    }
  };

  const handleClose = () => {
    if (document.activeElement) document.activeElement.blur();
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{editData ? "Edit Company" : "Add Company"}</h3>

        <input
          placeholder="Company Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <input
          placeholder="Authorized Person"
          value={form.authorizedPersonName}
          onChange={(e) => set("authorizedPersonName", e.target.value)}
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
        <input
          placeholder="Contact"
          value={form.contact}
          onChange={(e) => set("contact", e.target.value)}
        />

        <div className="modal-buttons">
          <button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : editData ? "Update" : "Save"}
          </button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;