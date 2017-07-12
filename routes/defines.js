function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
    });
}

// Chartevents
define("NBPsystolic", 455);
define("NBPdiastolic", 8441);
define("newNBPsystolic", 220050);
define("newNBPdiastolic", 220051);

// Labevents
define("hemoA1c", 50852);
define("glucoseBlood", 50931)
define("glucoseUrine", 51478)
define("creatinine", 50912);
define("albumin", 50862);
define("choles", 50907);
define("trigly", 51000);

// Prescriptions
define("simva", "Simvastatin");
define("lisin", "Lisinopril");
define("RR", "Risperidone");
define("acar", "Acarbose");
define("met", "Metformin");
define("Glit", "glinide");
define("DPP4", "gliptin");
define("SH", "Glimepiride");