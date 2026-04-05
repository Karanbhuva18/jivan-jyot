import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAddPatient,
  useCompanies,
  useUpdatePatient,
} from "../hooks/useAddPatient.js";
import "./CompanyPatient.css";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BILLING_ITEMS = [
  { key: "medicines", label: "Medicines" },
  { key: "dressing", label: "Dressing" },
  { key: "injection", label: "Injection" },
  { key: "tablet", label: "Tablet" },
  { key: "capsules", label: "Capsules" },
  { key: "iv", label: "I/V" },
  { key: "others", label: "OTHERS" },
];

const OTHER_OPTIONS = ["Others", "Gel", "Eye drops", "Lotion", "Cream", "Syp"];

const defaultBilling = Object.fromEntries(
  BILLING_ITEMS.flatMap(({ key }) => [
    [`${key}_qty`, ""],
    [`${key}_price`, ""],
  ]),
);

// ✅ Helper to get today as a string
const todayStr = () => new Date().toISOString().slice(0, 10);

// ✅ Helper to safely convert any date to string
const toDateStr = (val) => {
  if (!val) return todayStr();
  if (typeof val === "string") return val.slice(0, 10);
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return todayStr();
};

const CompanyPatient = () => {
  const { mutate, isPending } = useAddPatient();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdatePatient();
  const { data } = useCompanies();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state;
  const companies = data?.data || [];

  const [form, setForm] = useState({
    case_no: editData?.caseNo || "",
    date: toDateStr(editData?.date), // ✅ Always a string now
    patient_name: editData?.patientName || "",
    company_name: "",
    address: editData?.address || "",
    sex: editData?.sex || "Male",
    age: editData?.age || "",
    dr: editData?.dr || "Dr. Himanshu",
  });

  const [otherItem, setOtherItem] = useState("");
  const [billing, setBilling] = useState(defaultBilling);

  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const setBill = useCallback((key, val) => {
    setBilling((b) => ({ ...b, [key]: val }));
  }, []);

  const itemTotals = useMemo(
    () =>
      BILLING_ITEMS.map(({ key }) => {
        const qty = parseFloat(billing[`${key}_qty`]) || 0;
        const price = parseFloat(billing[`${key}_price`]) || 0;
        return qty * price;
      }),
    [billing],
  );

  const grandTotal = useMemo(
    () => itemTotals.reduce((a, b) => a + b, 0),
    [itemTotals],
  );

  const handleClear = useCallback(() => {
    setForm({
      case_no: "",
      date: todayStr(),
      patient_name: "",
      company_name: "",
      address: "",
      sex: "Male",
      age: "",
      dr: "Dr. Himanshu",
    });
    setBilling(defaultBilling);
  }, []);

  const handleSave = useCallback(() => {
    const billingItems = BILLING_ITEMS.map(({ key, label }) => {
      const qty = parseFloat(billing[`${key}_qty`]) || 0;
      const price = parseFloat(billing[`${key}_price`]) || 0;
      if (qty > 0 && price > 0) {
        return {
          name: key === "others" ? otherItem : label,
          qty,
          price,
          total: qty * price,
        };
      }
      return null;
    }).filter(Boolean);

    const payload = {
      date: form.date || todayStr(),
      caseNo: form.case_no,
      patientName: form.patient_name,
      companyId: form.company_name,
      address: form.address,
      sex: form.sex,
      age: form.age,
      dr: form.dr,
      billingItems,
      totalAmount: grandTotal,
    };

    if (editData?.id) {
      updateMutate(
        { id: editData.id, payload },
        {
          onSuccess: () => {
            toast.success("✅ Patient updated successfully");
            handleClear();
          },
          onError: (err) => {
            toast.error(
              err.response?.data?.message || "Error updating patient",
            );
            alert(err.response?.data?.message || "Error updating patient");
          },
        },
      );
    } else {
      mutate(payload, {
        onSuccess: () => {
          toast.success("✅ Patient saved successfully");
          handleClear();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Error saving patient");
        },
      });
    }
  }, [
    billing,
    form,
    otherItem,
    grandTotal,
    editData,
    mutate,
    updateMutate,
    handleClear,
  ]); // ✅ handleClear added

  useEffect(() => {
    if (!editData) return;

    if (editData.companyId && companies.length) {
      const company = companies.find((c) => c.id === editData.companyId);
      if (company) {
        setForm((prev) => ({ ...prev, company_name: company.id }));
      }
    }

    if (editData.billingItems?.length) {
      const billingData = { ...defaultBilling };
      const items =
        typeof editData.billingItems === "string"
          ? JSON.parse(editData.billingItems)
          : editData.billingItems;

      items.forEach((item) => {
        const match = BILLING_ITEMS.find(
          (b) => b.label.toLowerCase() === item.name.toLowerCase(),
        );
        if (match) {
          billingData[`${match.key}_qty`] = item.qty;
          billingData[`${match.key}_price`] = item.price;
        } else {
          billingData[`others_qty`] = item.qty;
          billingData[`others_price`] = item.price;
          setOtherItem(item.name);
        }
      });

      setBilling(billingData);
    }
  }, [editData, companies]);

  return (
    <div className="cp-page">
      <div className="cp-header">
        <h2 className="cp-title">🏥 Company Patient</h2>
      </div>

      <div className="cp-card">
        <div className="cp-section-title">Patient Information</div>

        <div className="cp-grid3">
          <div className="cp-field-group">
            <label className="cp-label">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="cp-input"
            />
          </div>

          <div className="cp-field-group">
            <label className="cp-label">Patient Name</label>
            <input
              className="cp-input"
              value={form.patient_name}
              onChange={(e) => set("patient_name", e.target.value)}
            />
          </div>

          <div className="cp-field-group">
            <label className="cp-label">Company Name</label>
            <select
              className="cp-input"
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="cp-field-group">
            <label className="cp-label">Address</label>
            <input
              className="cp-input"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div className="cp-field-group">
            <label className="cp-label">Gender</label>
            <input
              className="cp-input"
              value={form.sex}
              onChange={(e) => set("sex", e.target.value)}
            />
          </div>

          <div className="cp-field-group">
            <label className="cp-label">Age</label>
            <input
              className="cp-input"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="cp-card">
        <div className="cp-section-title">Billing Details</div>

        <table className="cp-billing-table">
          <thead>
            <tr>
              <th>Items</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {BILLING_ITEMS.map(({ key, label }, i) => (
              <tr key={key}>
                <td className="billing-label">
                  {key === "others" ? (
                    <select
                      className="other-option"
                      value={otherItem}
                      onChange={(e) => setOtherItem(e.target.value)}
                    >
                      {OTHER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    label
                  )}
                </td>
                <td className="billing-cell">
                  <input
                    value={billing[`${key}_qty`]}
                    onChange={(e) => setBill(`${key}_qty`, e.target.value)}
                    className="billing-input"
                  />
                </td>
                <td className="billing-cell">
                  <input
                    value={billing[`${key}_price`]}
                    onChange={(e) => setBill(`${key}_price`, e.target.value)}
                    className="billing-input"
                  />
                </td>
                <td className="billing-total">
                  <span className="total-value">{itemTotals[i]}</span>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" className="grand-total">
                Total
              </td>
              <td className="grand-total grand-total-value">{grandTotal}</td>
            </tr>
          </tbody>
        </table>

        <div className="btn-contianer">
          <button onClick={handleSave} disabled={isPending || isUpdating}>
            {isPending || isUpdating ? "Saving..." : "Save"}
          </button>
          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
    </div>
  );
};

export default CompanyPatient;
