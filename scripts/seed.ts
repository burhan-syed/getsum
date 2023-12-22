require('dotenv').config()
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { expenseSplits, expenses, groups, users, usersGroups } from "../src/lib/db/schema";
import crypto from 'crypto';

const DB_URI = process.env.DB_URI;
const queryClient = postgres(DB_URI!);
const db = drizzle(queryClient);

const data = [
  {
    title: "Monk's Café Coffee",
    total: 30,
    paidBy: "Jerry",
    splits: [
      { name: "Jerry", amount: 10 },
      { name: "Elaine", amount: 10 },
      { name: "George", amount: 10 },
    ],
  },
  {
    title: "Parking Ticket Fiasco",
    total: 60,
    paidBy: "George",
    splits: [
      { name: "George", amount: 20 },
      { name: "Jerry", amount: 20 },
      { name: "Elaine", amount: 20 },
    ],
  },
  {
    title: "Kramer's Grocery Extravaganza",
    total: 40,
    paidBy: "Kramer",
    splits: [
      { name: "Kramer", amount: 10 },
      { name: "Jerry", amount: 10 },
      { name: "Elaine", amount: 10 },
      { name: "George", amount: 10 },
    ],
  },
  {
    title: "Movie Night at Jerry's",
    total: 27,
    paidBy: "Jerry",
    splits: [
      { name: "Jerry", amount: 9 },
      { name: "Elaine", amount: 9 },
      { name: "George", amount: 9 },
    ],
  },
  {
    title: "Elaine's Gym Membership",
    total: 60,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 20 },
      { name: "Jerry", amount: 20 },
      { name: "Kramer", amount: 20 },
    ],
  },
  {
    title: "George's Frogger Addiction",
    total: 90,
    paidBy: "George",
    splits: [
      { name: "George", amount: 30 },
      { name: "Jerry", amount: 30 },
      { name: "Elaine", amount: 30 },
    ],
  },
  {
    title: "Jerry's Cable Bill",
    total: 75,
    paidBy: "Jerry",
    splits: [
      { name: "Jerry", amount: 25 },
      { name: "Elaine", amount: 25 },
      { name: "Kramer", amount: 25 },
    ],
  },
  {
    title: "Elaine's Muffin Madness",
    total: 18,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 6 },
      { name: "Jerry", amount: 6 },
      { name: "Kramer", amount: 6 },
    ],
  },
  {
    title: "George's Bagel Feast",
    total: 15,
    paidBy: "George",
    splits: [
      { name: "George", amount: 5 },
      { name: "Jerry", amount: 5 },
      { name: "Elaine", amount: 5 },
    ],
  },
  {
    title: "The Puffy Shirt Mishap",
    total: 60,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 20 },
      { name: "Jerry", amount: 20 },
      { name: "Kramer", amount: 20 },
    ],
  },
  {
    title: "J. Peterman's Himalayan Expedition",
    total: 300,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 100 },
      { name: "Jerry", amount: 100 },
      { name: "Kramer", amount: 100 },
    ],
  },
  {
    title: "George's Lost Keys Debacle",
    total: 60,
    paidBy: "George",
    splits: [
      { name: "George", amount: 20 },
      { name: "Jerry", amount: 20 },
      { name: "Elaine", amount: 20 },
    ],
  },
  {
    title: "Karaoke Chaos",
    total: 54,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 18 },
      { name: "Jerry", amount: 18 },
      { name: "Kramer", amount: 18 },
    ],
  },
  {
    title: "Newman's Mail Delivery Shenanigans",
    total: 30,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 10 },
      { name: "Jerry", amount: 10 },
      { name: "Kramer", amount: 10 },
    ],
  },
  {
    title: "Subway Snafu",
    total: 30,
    paidBy: "Jerry",
    splits: [
      { name: "Jerry", amount: 10 },
      { name: "George", amount: 10 },
      { name: "Elaine", amount: 10 },
    ],
  },
  {
    title: "Cable Bill Catastrophe",
    total: 90,
    paidBy: "Jerry",
    splits: [
      { name: "Jerry", amount: 30 },
      { name: "Elaine", amount: 30 },
      { name: "Kramer", amount: 30 },
    ],
  },
  {
    title: "Mall Misadventures",
    total: 72,
    paidBy: "Elaine",
    splits: [
      { name: "Elaine", amount: 24 },
      { name: "Jerry", amount: 24 },
      { name: "Kramer", amount: 24 },
    ],
  },
];

function generateRandomId(length: number) {
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  const randomId = buffer.toString('hex').slice(0, length);
  return encodeURIComponent(randomId);
}

(async () => {
  const names = new Set<string>();
  data.forEach((d) => {
    names.add(d.paidBy);
    d.splits.forEach((s) => names.add(s.name));
  });
  const { group, members } = await db.transaction(async (tx) => {
    const gInsert = await tx
      .insert(groups)
      .values({ id: generateRandomId(21), name: "seed" })
      .returning();
    const uInsert = await tx
      .insert(users)
      .values([...names].map((n) => ({ fullName: n })))
      .returning();
    await tx
      .insert(usersGroups)
      .values(uInsert.map((u) => ({ userId: u.id, groupId: gInsert[0].id })));
    return { group: gInsert[0], members: uInsert };
  });
  await Promise.allSettled(
    data.map(async (t) => {
      await db.transaction(async (tx) => {
        const paidBy = members.find((m) => m.fullName === t.paidBy);
        if (!paidBy) {
          throw new Error(`missing user ${t.paidBy}`)
        }
        const tInsert = await tx.insert(expenses).values({
          title: t.title,
          paidBy: paidBy.id,
          total: t.total,
          groupId: group.id,
          created: new Date(
            Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
          ),
        }).returning();
        const splits = t.splits.map(s => {
          const splitUser = members.find(m => m.fullName === s.name);
          if (!splitUser) {
            throw new Error(`missing user ${s.name}`)
          }
          return {
            expenseId: tInsert[0].id,
            amount: s.amount,
            userId: splitUser.id
          }
        });
        await tx.insert(expenseSplits).values(splits);
      });
    })
  );
  console.log("done", group);
})();
