import React, { useEffect, useState } from "react";
import * as miro from "./oauth/miro";
import { Board, BoardMember } from "@mirohq/miro-api";
import { Action, ActionPanel, Detail, Icon, List, showToast, Toast, useNavigation } from "@raycast/api";
import ShareBoard from "./share-board";
import InviteBoard from "./invite-board";

export default function ListBoards() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<Board[]>([]);

  const { push } = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        await miro.authorize();
        const fetchedItems = await miro.fetchItems();
        setItems(fetchedItems);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        await showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, []);

  if (isLoading) {
    return <Detail isLoading={isLoading} />;
  }

  return (
    <List isLoading={isLoading}>
      {items.map((item) => {
        return (
          <List.Item
            key={item.id}
            id={item.id}
            icon={Icon.Document}
            title={item.name}
            subtitle={item.description}
            actions={
              <ActionPanel>
                {item.viewLink && (
                  <>
                    <Action.OpenInBrowser url={item.viewLink} />
                    <Action.CopyToClipboard title="Copy URL" content={item.viewLink} />
                    <Action
                      title="Invite to Board"
                      icon={Icon.PersonCircle}
                      onAction={() => push(<InviteBoard id={item.id} />)}
                      shortcut={{ modifiers: ["cmd"], key: "i" }}
                    />
                  </>
                )}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
