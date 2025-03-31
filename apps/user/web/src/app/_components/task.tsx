"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestTask() {
	const [latestTask] = api.task.getLatest.useSuspenseQuery();

	const utils = api.useUtils();
	const [name, setName] = useState("");
	const createTask = api.task.create.useMutation({
		onSuccess: async () => {
			await utils.task.invalidate();
			setName("");
		},
	});

	return (
		<div className="w-full max-w-xs">
			{latestTask ? (
				<p className="truncate">Your most recent task: {latestTask.name}</p>
			) : (
				<p>You have no tasks yet.</p>
			)}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					createTask.mutate({ name });
				}}
				className="flex flex-col gap-2"
			>
				<input
					type="text"
					placeholder="Title"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-full px-4 py-2 text-black"
				/>
				<button
					type="submit"
					className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
					disabled={createTask.isPending}
				>
					{createTask.isPending ? "Submitting..." : "Submit"}
				</button>
			</form>
		</div>
	);
}
