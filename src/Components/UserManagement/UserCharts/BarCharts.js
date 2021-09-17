import React from 'react'
import {Bar} from 'react-chartjs-2'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { gridClasses } from '@mui/x-data-grid';


const BarCharts = () => {
   
    return (
       
        <div style={{marginTop:70}}>
            <h5 className="bar-title">Bar Chart</h5>
            <Bar 
            data={{

                labels:[ 'web app', 'mobile app', 'api', 'wordpress plugin', 'shopify', 'Orange'],
                datasets:[
                    {
                        labels: '# of votes',
                        data: [12 ,19 , 3 , 5 ,2 ,3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor:[

                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth:1,
                    }
                ]
            }}
            height={150}
            width={400}
           
            />
        </div>
    )
}

export default BarCharts
