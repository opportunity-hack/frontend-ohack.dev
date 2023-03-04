import parse from 'html-react-parser';

export default function HTMLPreview(props){
    return(
        <html>
            {
                 parse(props.html)
             }
        </html>
    )
}