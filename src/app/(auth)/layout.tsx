interface Props {
    children:React.ReactNode;
}



const Layout = ({children}: Props) => {
    return (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                {children}
            </div>
        </div>
    );
}
 
export default Layout;