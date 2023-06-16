import IconAdd from "./icons/IconAdd";
import IconMenu from "./icons/IconsMenu";

type Props = {
  title: string;
  openSidebarClick: () => void;
  newChatClick:() => void;
}
export const Header = ({title, openSidebarClick, newChatClick}: Props) => {
  return (
    <header className="flex justify-between bg-blue-900 text-white items-center w-full border-b border-b-gray-600 p-2 md:hidden">
      <div onClick={openSidebarClick}>
        <IconMenu width={24} height={24} />
      </div>
      <div className="mx-2 truncate">{title}</div>
      <div onClick={newChatClick}>
        <IconAdd width={24} height={24} />
      </div>
    </header>
  );
}