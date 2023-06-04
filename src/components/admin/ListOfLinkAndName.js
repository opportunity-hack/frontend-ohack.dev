import LinkAndName from "./LinkAndName";

export default function ListOfLinkAndName({ LinkAndNameComponents, name }) {
    
    
    
    return (
        <div className="content-layout">
            <h1 className="content__title">{name}</h1>
            <div className="content__body">
            {
                LinkAndNameComponents && LinkAndNameComponents.map((item, index) => (
                    <LinkAndName _link={item._link} _name={item._name} key={index}/>
                ))                                    
            }                     
            </div>
        </div>        
    );
};