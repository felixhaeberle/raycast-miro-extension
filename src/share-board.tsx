// ShareBoard component
// This component is used to share the board with other users

import { BoardMember } from "@mirohq/miro-api";
import { Action, ActionPanel, Detail, Form, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import * as miro from "./oauth/miro";

interface ShareBoardProps {
  boardId: string;
  email: string;
  role: BoardMember["role"];
  message: string;
}

export default function ShareBoard({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [selectedBoardMember, setSelectedBoardMember] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<BoardMember["role"]>("Guest");

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    (async () => {
      try {
        const boardMembers = await miro.getBoardMembers(id);
        setBoardMembers(boardMembers);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        await showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, []);

  useEffect(() => {
    if (boardMembers.length > 0 && boardMembers[0].role) {
      setSelectedBoardMember(boardMembers[0].id.toString());
      const role = capitalizeFirstLetter(boardMembers[0].role);
      setCurrentRole(role);
    }
  }, [boardMembers]);

  // seeffect which set current role based on selected board member
  useEffect(() => {
    const findSelectedBoardMember = (id: string) => {
      return boardMembers.find((boardMember) => boardMember.id.toString() === id);
    };

    if (selectedBoardMember) {
      const selectedBoardMemberObject = findSelectedBoardMember(selectedBoardMember);
      if (selectedBoardMemberObject?.role) {
        const role = capitalizeFirstLetter(selectedBoardMemberObject.role);
        setCurrentRole(role);
      }
    }
  }, [selectedBoardMember, boardMembers]);

  if (isLoading) {
    return <Detail isLoading={isLoading} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Share Board"
            onSubmit={async (values: ShareBoardProps) => {
              try {
                await miro.inviteToBoard(id, { email: values.email, role: BoardMember.RoleEnum.Commenter }, values.message);
                await showToast({ style: Toast.Style.Success, title: "Board shared" });
              } catch {
                await showToast({ style: Toast.Style.Failure, title: "Board sharing failed" });
              }
            }}
          />
        </ActionPanel>
      }
    >
      {/* dropdown for members */}
      <Form.Dropdown
        id="boardMember"
        title="Board Member"
        value={selectedBoardMember}
        onChange={(value) => {
          setSelectedBoardMember(value);
        }}
      >
        {boardMembers.map((boardMember) => (
          <Form.Dropdown.Item key={boardMember.id} title={boardMember.name} value={boardMember.id.toString()} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="role" title="Role" value={currentRole} onChange={setCurrentRole}>
        {(Object.keys(BoardMember.RoleEnum) as Array<keyof typeof BoardMember.RoleEnum>).map((role) => (
          <Form.Dropdown.Item key={role} value={role} title={role} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
