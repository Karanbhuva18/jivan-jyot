import { useState, useEffect } from "react";
import {
  useCompanies,
  usePatients,
  useDeletePatient,
} from "../hooks/useAddPatient.js";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { buildPrintHTML } from "../components/PrintTemplets.jsx";
import toast from "react-hot-toast";

const openPrintWindow = (html, preview = false) => {
  const win = window.open("", "_blank", "width=960,height=720,scrollbars=yes");
  if (!win) {
    toast.success("Popup blocked! Please allow popups for this app.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();

  if (!preview) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
};

const PatientReport = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    companyId: "",
    dr: "",
    page: 1,
    limit: 7,
  });

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const { data, isLoading } = usePatients(filters);
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { mutate: deleteMutate, isPending: deleting } =
    useDeletePatient(filters);
  const navigate = useNavigate();

  const patients = data?.data || [];
  const [companiesData, setCompaniesData] = useState([]);
  useEffect(() => {
    if (companies?.data?.length > 0) {
      setCompaniesData(
        companies.data.map((comp) => ({ id: comp.id, companyName: comp.name })),
      );
    }
  }, [companies]);

  const handlePrint = () => {
    if (patients.length === 0) {
      toast.success("No patients found to print.");
      return;
    }
    openPrintWindow(buildPrintHTML(patients, filters, companiesData), false);
  };

  const handlePreview = () => {
    if (patients.length === 0) {
      toast.success("No patients found to print.");
      return;
    }
    openPrintWindow(buildPrintHTML(patients, filters, companiesData), true);
  };

  const handleEdit = (patient) =>
    navigate("/company-patient", { state: patient });

  const handleFilterChange = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const handleDelete = (id) => {
    if (!window.confirm("Delete this patient?")) return;

    deleteMutate(id, {
      onSuccess: () => {
        toast.success("Patient deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete patient");
      },
    });
  };

  if (companiesLoading) return <Loader fullScreen text="Loading..." />;

  const noDoctorSelected = !filters.dr;

  return (
    <div>
      <h2>Patient Report</h2>

      {/* FILTERS */}
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div>
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        <div>
          <label>Company</label>
          <select
            value={filters.companyId}
            onChange={(e) => handleFilterChange("companyId", e.target.value)}
          >
            <option value="">All Companies</option>
            {companiesData.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Doctor</label>
          <select
            value={filters.dr}
            onChange={(e) => handleFilterChange("dr", e.target.value)}
            style={{
              borderColor: noDoctorSelected ? "#f87171" : undefined,
              outline: noDoctorSelected ? "1px solid #f87171" : undefined,
            }}
          >
            <option value="">-- Select Doctor --</option>
            <option value="Dr. Himanshu">Dr. Himanshu</option>
            <option value="Dr. Darshak">Dr. Darshak</option>
          </select>
        </div>

        {/* 👁️ PREVIEW */}
        <button
          onClick={handlePreview}
          title={noDoctorSelected ? "Select a doctor first" : "Preview report"}
          style={{
            padding: "6px 16px",
            background: noDoctorSelected ? "#f3f4f6" : "#f3f4f6",
            color: noDoctorSelected ? "#9ca3af" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: noDoctorSelected ? "not-allowed" : "pointer",
            fontWeight: 600,
            height: "34px",
          }}
        >
          👁️ Preview
        </button>

        {/* 🖨️ PRINT */}
        <button
          onClick={handlePrint}
          title={noDoctorSelected ? "Select a doctor first" : "Print report"}
          style={{
            padding: "6px 16px",
            background: noDoctorSelected ? "#93c5fd" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: noDoctorSelected ? "not-allowed" : "pointer",
            fontWeight: 600,
            height: "34px",
          }}
        >
          🖨️ Print
        </button>
      </div>

      {/* Warning if no doctor selected */}
      {noDoctorSelected && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "10px" }}>
          ⚠️ Please select a Doctor to enable Print & Preview.
        </p>
      )}

      {/* TABLE */}
      {isLoading ? (
        <Loader text="Fetching patients..." />
      ) : patients.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0" }}>
          No patients found.
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Gender</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.date)}</td>
                <td>{p.patientName}</td>
                <td>{p.sex}</td>
                <td>{p.totalAmount}</td>
                <td style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}
      {data?.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            disabled={filters.page === 1}
          >
            Prev
          </button>

          {Array.from({ length: data?.totalPages || 1 }, (_, i) => i + 1).map(
            (pg) => (
              <button
                key={pg}
                onClick={() => setFilters((f) => ({ ...f, page: pg }))}
                style={{
                  fontWeight: filters.page === pg ? "bold" : "normal",
                  textDecoration: filters.page === pg ? "underline" : "none",
                }}
              >
                {pg}
              </button>
            ),
          )}

          <button
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            disabled={filters.page === data?.totalPages}
          >
            Next
          </button>

          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Page {data?.currentPage} of {data?.totalPages} —{" "}
            {data?.totalRecords} total
          </span>
        </div>
      )}
    </div>
  );
};

export default PatientReport;
