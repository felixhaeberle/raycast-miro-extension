import { Alert, confirmAlert, showToast, Toast } from "@raycast/api";
import * as miro from "./oauth/miro";

// remove member react component
export default async function RemoveMember({ id, memberId }: { id: string; memberId: string }) {
  const options: Alert.Options = {
    title: "Remove Member",
    message: "Are you sure you want to remove this member?",
    primaryAction: {
      title: "Remove",
      style: Alert.ActionStyle.Destructive,
      onAction: async () => {
        try {
          await miro.removeBoardMember(id, memberId);
          await showToast({ style: Toast.Style.Success, title: "🎉 Removed member!" });
        } catch {
          await showToast({ style: Toast.Style.Failure, title: "Remove member failed." });
        }
      },
    },
  };
  await confirmAlert(options);
}
