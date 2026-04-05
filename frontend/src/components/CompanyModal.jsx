import { useState } from "react";
import { useCreateCompany } from "../hooks/useAddPatient.js";
import "./CompanyModal.css";
import toast from "react-hot-toast";

const CompanyModal = ({ close }) => {
  const { mutate, isPending } = useCreateCompany();

  const [form, setForm] = useState({
    name: "",
    authorizedPersonName: "",
    address: "",
    contact: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    mutate(form, {
      onSuccess: () => {
        toast.success("✅ Company created successfully");
        if (document.activeElement) document.activeElement.blur();
        close();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "❌ Error creating company");
      },
    });
  };

  const handleClose = () => {
    if (document.activeElement) document.activeElement.blur();
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Company</h3>

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
            {isPending ? "Saving..." : "Save"}
          </button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
