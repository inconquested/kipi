import { db } from "../lib/db";

const departments = [
  { name: "Sistem Informasi Jaringan dan Aplikasi", code: "SIJA" },
  { name: "Rekayasa Perangkat Lunak", code: "RPL" },
  { name: "Teknik Elektronika Komunikasi", code: "TEK" },
  { name: "Teknik Elektronika Industri", code: "TEI" },
  { name: "Instrumentasi Otomasi Proses", code: "IOP" },
  { name: "Teknik Pendingin dan Tata Udara", code: "TPTU" },
  { name: "Program Siaran Perfilman dan Televisi", code: "PSPT" },
  { name: "Mekatronika", code: "MEKA" },
  { name: "Teknik Otomasi Industri", code: "TOI" },
];

async function main() {
  console.log("Start seeding departments...");
  
  for (const dept of departments) {
    const department = await db.department.upsert({
      where: { code: dept.code },
      update: {},
      create: {
        name: dept.name,
        code: dept.code,
      },
    });
    console.log(`Upserted department: ${department.name} (${department.code})`);
  }
  
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // No explicit disconnect needed if using db from lib/db as it's a singleton usually, 
    // but PrismaClient has it.
  });
