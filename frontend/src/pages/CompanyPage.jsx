import { useState } from "react";
import { useCompanies, useDeleteCompany } from "../hooks/useAddPatient.js";
import CompanyModal from "../components/CompanyModal.jsx";
import "./Company.css";

const CompanyPage = () => {
  const { data, isLoading } = useCompanies();
  const companies = data?.data || [];
  const [open, setOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  const handleDelete = (id) => {
    deleteCompany(id);
  };

  const handleEdit = (company) => {
    console.log('company',company);
    setEditCompany(company);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCompany(null);
  };

  return (
    <div className="company-page">
      <div className="company-header">
        <h2>🏢 Companies</h2>
        <button className="add-company-btn" onClick={() => setOpen(true)}>
          + Add Company
        </button>
      </div>

      <table className="company-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Authorized Person</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.authorizedPersonName}</td>
              <td>{c.address}</td>
              <td>{c.contact}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => handleEdit(c)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(c.id)}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && <CompanyModal close={handleClose} editData={editCompany} />}
    </div>
  );
};

export default CompanyPage;
