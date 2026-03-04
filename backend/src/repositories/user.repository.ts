import type { RoleName, User } from "@prisma/client";

import { prisma } from "../prisma/client";

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  roleName: RoleName;
};

export async function findUserByEmail(
  email: string,
): Promise<(User & { role: { name: RoleName } }) | null> {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function findUserById(
  id: string,
): Promise<(User & { role: { name: RoleName } }) | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function createUser(
  input: CreateUserInput,
): Promise<User & { role: { name: RoleName } }> {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: {
        connect: {
          name: input.roleName,
        },
      },
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });
}
