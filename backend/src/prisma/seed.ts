import { PrismaClient, Prisma, OrderStatus, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USER_COUNT = 1000;
const CUSTOMER_COUNT = 3000;
const PRODUCT_COUNT = 500;
const ORDER_COUNT = 10000;
const ORDER_BATCH_SIZE = 100;
const BCRYPT_ROUNDS = 10;
const PASSWORD = "ChangeMe123!";
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Apparel",
  "Home",
  "Beauty",
  "Grocery",
  "Sports",
];

type SeedCustomer = {
  id: string;
};

type SeedProduct = {
  id: string;
  price: Prisma.Decimal;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function weightedOrderStatus(): OrderStatus {
  const roll = Math.random();

  if (roll < 0.75) {
    return OrderStatus.COMPLETED;
  }

  if (roll < 0.9) {
    return OrderStatus.PENDING;
  }

  return OrderStatus.CANCELLED;
}

function weightedRole(): RoleName {
  const roll = Math.random();

  if (roll < 0.03) {
    return RoleName.ADMIN;
  }

  if (roll < 0.18) {
    return RoleName.MANAGER;
  }

  return RoleName.ANALYST;
}

function randomPastDate(daysBack: number): Date {
  const now = Date.now();
  const offsetDays = randomInt(0, daysBack);
  const offsetMs = randomInt(0, 24 * 60 * 60 * 1000);

  return new Date(now - offsetDays * 24 * 60 * 60 * 1000 - offsetMs);
}

function decimalFromNumber(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function buildUniqueProducts(products: SeedProduct[], count: number): SeedProduct[] {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled.slice(0, count);
}

async function resetData(): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
}

async function seedRoles(): Promise<Record<RoleName, string>> {
  const definitions = [
    {
      name: RoleName.ADMIN,
      description: "Full platform access",
    },
    {
      name: RoleName.MANAGER,
      description: "Operational management access",
    },
    {
      name: RoleName.ANALYST,
      description: "Read-only analytics access",
    },
  ];

  for (const definition of definitions) {
    await prisma.role.upsert({
      where: { name: definition.name },
      update: { description: definition.description },
      create: definition,
    });
  }

  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return roles.reduce<Record<RoleName, string>>((accumulator, role) => {
    accumulator[role.name] = role.id;
    return accumulator;
  }, {
    [RoleName.ADMIN]: "",
    [RoleName.MANAGER]: "",
    [RoleName.ANALYST]: "",
  });
}

async function seedUsers(roleIds: Record<RoleName, string>): Promise<void> {
  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  const users = Array.from({ length: USER_COUNT }, (_, index) => {
    const userNumber = index + 1;
    const roleName = weightedRole();

    return {
      name: `User ${userNumber}`,
      email: `user${userNumber.toString().padStart(4, "0")}@example.com`,
      passwordHash,
      roleId: roleIds[roleName],
    };
  });

  await prisma.user.createMany({
    data: users,
  });
}

async function seedCustomers(): Promise<SeedCustomer[]> {
  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const customerNumber = index + 1;

    return {
      name: `Customer ${customerNumber}`,
      email: `customer${customerNumber.toString().padStart(4, "0")}@example.com`,
    };
  });

  await prisma.customer.createMany({
    data: customers,
  });

  return prisma.customer.findMany({
    select: {
      id: true,
    },
  });
}

async function seedProducts(): Promise<SeedProduct[]> {
  const products = Array.from({ length: PRODUCT_COUNT }, (_, index) => {
    const productNumber = index + 1;
    const category = randomElement(PRODUCT_CATEGORIES);
    const basePrice = randomInt(15, 500) + Math.random();

    return {
      name: `${category} Product ${productNumber}`,
      sku: `SKU-${productNumber.toString().padStart(6, "0")}`,
      category,
      price: decimalFromNumber(basePrice),
      stock: randomInt(10, 500),
    };
  });

  await prisma.product.createMany({
    data: products,
  });

  return prisma.product.findMany({
    select: {
      id: true,
      price: true,
    },
  });
}

async function seedOrders(customers: SeedCustomer[], products: SeedProduct[]): Promise<void> {
  for (let offset = 0; offset < ORDER_COUNT; offset += ORDER_BATCH_SIZE) {
    const batch: Prisma.PrismaPromise<unknown>[] = [];
    const batchSize = Math.min(ORDER_BATCH_SIZE, ORDER_COUNT - offset);

    for (let index = 0; index < batchSize; index += 1) {
      const customer = randomElement(customers);
      const status = weightedOrderStatus();
      const createdAt = randomPastDate(90);
      const distinctItems = randomInt(1, 5);
      const selectedProducts = buildUniqueProducts(products, distinctItems);

      const orderItems = selectedProducts.map((product) => {
        const quantity = randomInt(1, 4);
        const unitPrice = new Prisma.Decimal(product.price);
        const subtotal = unitPrice.mul(quantity);

        return {
          productId: product.id,
          quantity,
          unitPrice,
          subtotal,
          createdAt,
          updatedAt: createdAt,
        };
      });

      const totalAmount = orderItems.reduce(
        (sum, item) => sum.add(item.subtotal),
        new Prisma.Decimal(0),
      );

      batch.push(
        prisma.order.create({
          data: {
            customerId: customer.id,
            status,
            totalAmount,
            createdAt,
            updatedAt: createdAt,
            orderItems: {
              create: orderItems,
            },
          },
        }),
      );
    }

    await prisma.$transaction(batch);
    console.log(`Seeded ${Math.min(offset + batchSize, ORDER_COUNT)} of ${ORDER_COUNT} orders`);
  }
}

async function main(): Promise<void> {
  console.log("Resetting existing demo data...");
  await resetData();

  console.log("Seeding roles...");
  const roleIds = await seedRoles();

  console.log("Seeding users...");
  await seedUsers(roleIds);

  console.log("Seeding customers...");
  const customers = await seedCustomers();

  console.log("Seeding products...");
  const products = await seedProducts();

  console.log("Seeding orders and order items...");
  await seedOrders(customers, products);

  console.log("Seed complete.");
  console.log(`Demo user password: ${PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
