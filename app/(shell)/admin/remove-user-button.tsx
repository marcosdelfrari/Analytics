"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removePlatformUser } from "@/app/(shell)/admin/actions";
import { ConfirmDialog } from "@/app/components/confirm-dialog";

type RemoveUserButtonProps = {
  userId: string;
  userName: string;
  email: string;
};

export function RemoveUserButton({
  userId,
  userName,
  email,
}: RemoveUserButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", userId);
        formData.set("email", email);
        await removePlatformUser(formData);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Não foi possível remover este usuário. Tente novamente.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="cursor-pointer rounded-lg border border-negative/35 px-2.5 py-1 text-[11.5px] text-negative transition hover:bg-negative/10"
      >
        Remover
      </button>

      <ConfirmDialog
        open={open}
        tone="danger"
        pending={isPending}
        title={`Remover ${userName}?`}
        description={`Isso apaga a conta de ${email}, códigos de login e todos os acessos em organizações. Não dá para desfazer.`}
        confirmLabel="Sim, remover"
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!isPending) setOpen(false);
        }}
        onConfirm={handleConfirm}
      />

      {open && error ? (
        <div className="fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4 pointer-events-none">
          <p className="rounded-xl border border-negative/35 bg-negative/15 px-4 py-2 text-[12px] text-negative shadow-lg">
            {error}
          </p>
        </div>
      ) : null}
    </>
  );
}
