interface DropDownMenuProps {
    visible: boolean;
}

export const DropDownMenu = ({visible}: {visible:boolean}) => {

    return(
        <aside className={`${visible? 'h-50 w-30 opacity-100':'h-0 w-0 opacity-0'} transition-all absolute right-0 bg-gray-800`}>
            <ol>
                <li className="cursor-pointer hover:bg-sky-700 transition-all">설정</li>
            </ol>
        </aside>
    )
}