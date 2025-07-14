module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "products",
      [
        // AIR MASTER
        {
          code: "GD0607",
          name: "AIR MASTER BOOSTER ENCAVA/MITSUBISHI FK617/FK615",
          description: "Booster de aire para vehículos Mitsubishi",
          price: 200.0,
          status: "oferta",
          brandId: 2, // TW
          categoryId: 1, // AIR MASTER
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // ALTERNADORES
        {
          code: "GD0462",
          name: "ALTERNADOR CUMMINS CARGO 815-1721 12V",
          description: "Alternador para motor Cummins",
          price: 160.0,
          status: "disponible",
          brandId: 1, // TENKEI
          categoryId: 2, // ALTERNADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "GD0590",
          name: "ALTERNADOR ISUZU FVR/FSR 24V",
          description: "Alternador 24V para vehículos Isuzu",
          price: 240.0,
          status: "disponible",
          brandId: 1, // TENKEI
          categoryId: 2, // ALTERNADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "GD0227",
          name: "ALTERNADOR ISUZU 12V NPR/ENT900 CON BOMBA DE VACIO",
          description: "Alternador con bomba de vacío integrada",
          price: 200.0,
          status: "disponible",
          brandId: 1, // TENKEI
          categoryId: 2, // ALTERNADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // AMORTIGUADORES
        {
          code: "GD0576",
          name: "AMORTIGUADOR DELANTERO ISUZU FVR (UND)",
          description: "Amortiguador delantero para Isuzu FVR",
          price: 60.0,
          status: "disponible",
          brandId: 3, // ISUZU
          categoryId: 3, // AMORTIGUADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "GD0535",
          name: "AMORTIGUADOR DELANTERO ISUZU FVR/6HH1/FSR 65400 (UND)",
          description: "Amortiguador delantero para modelos específicos Isuzu",
          price: 90.0,
          status: "disponible",
          brandId: 4, // MONROE
          categoryId: 3, // AMORTIGUADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "GD0537",
          name: "AMORTIGUADOR DELANTERO ISUZU NKR/NHR 667/17/34/88 (UND)",
          description: "Amortiguador delantero para serie NKR/NHR",
          price: 47.0,
          status: "nuevo",
          brandId: 4, // MONROE
          categoryId: 3, // AMORTIGUADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "GD0536",
          name: "AMORTIGUADOR TRASERO ENCAVA 610",
          description: "Amortiguador trasero para Encava 610",
          price: 40.0,
          status: "oferta",
          brandId: 4, // MONROE
          categoryId: 3, // AMORTIGUADORES
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", null, {})
  },
}
