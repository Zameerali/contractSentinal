import React from "react";
import { clsx } from "clsx";
import { Button } from "./button";
interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ActionGroup {
  title: string;
  actions: Action[];
}

interface DynamicActionsMenuProps {
  groups: ActionGroup[];
  deleteAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
  className?: string;
}

export const DynamicActionsMenu: React.FC<DynamicActionsMenuProps> = ({
  groups,
  deleteAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        "w-full md:w-[500px] max-h-[70vh] flex flex-col bg-white rounded-lg shadow-lg border border-gray-200",
        className
      )}
    >
      {/* Action Groups - Scrollable container */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200"
            >
              {/* Group Title */}
              <div className="mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {group.title}
              </div>

              {/* Group Actions */}
              <div className="space-y-1">
                {group.actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={clsx(
                      "w-full flex items-center gap-2.5 py-1.5 text-sm text-gray-900 rounded-md transition-colors",
                      action.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100 active:bg-gray-100 cursor-pointer"
                    )}
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-gray-700">
                      {action.icon}
                    </span>
                    <span className="flex-1 text-left">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Button - Sticky at bottom */}
      {deleteAction && (
        <div className="px-4 pb-4 bg-white rounded-b-lg flex">
          <Button
            color="danger-light"
            size="sm"
            onClick={deleteAction.onClick}
            className="flex items-center gap-2 ml-auto cursor-pointer"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {deleteAction.icon}
            </span>
            <span>{deleteAction.label}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
