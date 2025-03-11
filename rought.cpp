# include <iostream>
using namespace std;

void reverseArry(int arr[],int start,int end){
    while(start<end){
        swap(arr[start],arr[end]);
        start++;
        end--;
    }
}

void rotateArray(int arr[],int size,int step){
    int n=step%size;
    reverseArry(arr,0,size-1);
    reverseArry(arr,0,size-step-1);
    reverseArry(arr,step,size-1);

}

int largest(int arr[],int length){
        int largestNum=arr[0];
        for(int i=1;i <length;i++){
                if(arr[i]>largestNum){
                    largestNum=arr[i];
                }
        }
        return largestNum;
}

int main(){

    int arr[]={2,3,4,5,6,68,34};
   
    cout<<"largest Number"<< largest(arr,7);
    return 0;
}