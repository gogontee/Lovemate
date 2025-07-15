import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import withAdminAuth from "../../components/withAdminAuth";

function AdminSettings() {
  const [settings, setSettings] = useState({
    vote_start: "",
    vote_end: "",
    registration_open: true,
    current_stage: "",
    vote_price: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("settings").select("*").single();

      if (error) {
        console.error("Fetch error:", error);
      } else if (data) {
        setSettings(data);
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);

    const { error } = await supabase.from("settings").update(settings).eq("id", settings.id);

    if (error) {
      console.error("Save error:", error);
      alert("Failed to save settings");
    } else {
      alert("Settings saved successfully!");
    }

    setSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Show Control Panel</h2>

          {loading ? (
            <p>Loading settings...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vote Start</label>
                <input
                  type="datetime-local"
                  name="vote_start"
                  value={settings.vote_start?.slice(0, 16) || ""}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vote End</label>
                <input
                  type="datetime-local"
                  name="vote_end"
                  value={settings.vote_end?.slice(0, 16) || ""}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Registration Status
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="registration_open"
                    checked={settings.registration_open}
                    onChange={handleChange}
                  />
                  <span>{settings.registration_open ? "Open" : "Closed"}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Stage</label>
                <select
                  name="current_stage"
                  value={settings.current_stage}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded"
                >
                  <option value="">-- Select --</option>
                  <option value="Audition">Audition</option>
                  <option value="Top 100">Top 100</option>
                  <option value="Top 20">Top 20</option>
                  <option value="Finale">Finale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vote Price (₦)</label>
                <input
                  type="number"
                  name="vote_price"
                  value={settings.vote_price || ""}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded"
                  placeholder="e.g. 50"
                />
              </div>

              <div className="md:col-span-2 mt-6">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded shadow"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminSettings);
