import { useState } from "react";
import { useCompanies } from "../hooks/useAddPatient.js";
import CompanyModal from "../components/CompanyModal.jsx";
import "./Company.css";

const CompanyPage = () => {
  const { data, isLoading } = useCompanies();
  const companies = data?.data || [];

  const [open, setOpen] = useState(false);

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
          </tr>
        </thead>

        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.authorizedPersonName}</td>
              <td>{c.address}</td>
              <td>{c.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && <CompanyModal close={() => setOpen(false)} />}
    </div>
  );
};

export default CompanyPage;
